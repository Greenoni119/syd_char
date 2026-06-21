import { createClient, createServiceClient } from "./supabase/server";
import { requireAuth } from "./auth.server";

const BUCKET_NAME = "wedding-media";

export interface MediaFile {
  id: string;
  file_name: string;
  storage_path: string;
  file_size: number;
  mime_type: string;
  uploaded_at: string;
  media_type: "photo" | "video";
}

export async function uploadFile(
  file: File,
  mediaType: "photo" | "video",
): Promise<MediaFile | null> {
  const session = await requireAuth();
  const supabase = await createClient();
  const serviceSupabase = createServiceClient();

  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `${mediaType}s/${fileName}`;

  // Upload to Supabase Storage using service role to bypass RLS
  const { data: uploadData, error: uploadError } = await serviceSupabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file);

  if (uploadError) {
    console.error("Upload error:", uploadError);
    return null;
  }

  // Insert metadata into database
  const { data: mediaData, error: dbError } = await supabase
    .from("media")
    .insert({
      file_name: file.name,
      storage_path: filePath,
      file_size: file.size,
      mime_type: file.type,
      uploaded_by: session.id,
      media_type: mediaType,
    })
    .select()
    .single();

  if (dbError) {
    console.error("Database error:", dbError);
    // Clean up the uploaded file using service role
    await serviceSupabase.storage.from(BUCKET_NAME).remove([filePath]);
    return null;
  }

  return mediaData;
}

export async function getMediaFiles(
  limit: number = 20,
  offset: number = 0,
): Promise<MediaFile[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("media")
    .select("*")
    .order("uploaded_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("Error fetching media:", error);
    return [];
  }

  return data || [];
}

export async function getSignedUrl(
  storagePath: string,
): Promise<string | null> {
  const supabase = await createClient();

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(storagePath, 60 * 60); // 1 hour expiry

  if (error) {
    console.error("Error creating signed URL:", error);
    return null;
  }

  return data.signedUrl;
}

export async function deleteMediaFile(id: string): Promise<boolean> {
  const supabase = await createClient();

  // Get the file path first
  const { data: mediaData, error: fetchError } = await supabase
    .from("media")
    .select("storage_path")
    .eq("id", id)
    .single();

  if (fetchError || !mediaData) {
    return false;
  }

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([mediaData.storage_path]);

  if (storageError) {
    console.error("Storage delete error:", storageError);
    return false;
  }

  // Delete from database
  const { error: dbError } = await supabase.from("media").delete().eq("id", id);

  if (dbError) {
    console.error("Database delete error:", dbError);
    return false;
  }

  return true;
}

export async function getMediaStats(): Promise<{
  totalPhotos: number;
  totalVideos: number;
  totalStorage: number;
}> {
  const supabase = await createClient();

  const { data: photos, error: photosError } = await supabase
    .from("media")
    .select("file_size")
    .eq("media_type", "photo");

  const { data: videos, error: videosError } = await supabase
    .from("media")
    .select("file_size")
    .eq("media_type", "video");

  if (photosError || videosError) {
    return { totalPhotos: 0, totalVideos: 0, totalStorage: 0 };
  }

  const totalPhotos = photos?.length || 0;
  const totalVideos = videos?.length || 0;
  const totalStorage =
    (photos?.reduce((sum, file) => sum + (file.file_size || 0), 0) || 0) +
    (videos?.reduce((sum, file) => sum + (file.file_size || 0), 0) || 0);

  return {
    totalPhotos,
    totalVideos,
    totalStorage,
  };
}
