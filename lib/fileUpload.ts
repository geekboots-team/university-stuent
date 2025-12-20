import { supabase } from "./supabase";

export async function uploadProfileImage(
  file: File,
  userId: string
): Promise<string> {
  // Validate file type
  if (!file.type.startsWith("image/")) {
    throw new Error("Please select a valid image file (JPG, JPEG, PNG)");
  }

  // Validate file size (5MB max)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    throw new Error("File size must be less than 5MB");
  }

  // Generate a unique filename
  const fileExtension = file.name.split(".").pop();
  const uploadFileName = `${userId}-${Date.now()}.${fileExtension}`;

  try {
    // Upload file to Supabase Storage

    const { error } = await supabase.storage
      .from("universitySenior") // Make sure this bucket exists in your Supabase Storage
      .upload(`avatars/${uploadFileName}`, file, {
        cacheControl: "3600",
        upsert: true, // Allow overwriting
      });

    if (error) {
      throw new Error(`Failed to upload image: ${error.message}`);
    }

    // Get the public URL
    const {
      data: { publicUrl },
    } = supabase.storage
      .from("universitySenior")
      .getPublicUrl(`avatars/${uploadFileName}`);

    return publicUrl;
  } catch (error) {
    throw error;
  }
}

export async function deleteProfileImage(filePath: string): Promise<void> {
  try {
    // Extract the file path from the URL
    const pathParts = filePath.split("/");
    const fileName = pathParts[pathParts.length - 1];
    const relativePath = `profiles/${fileName}`;

    const { error } = await supabase.storage
      .from("universitySenior")
      .remove([relativePath]);

    if (error) {
      throw new Error(`Failed to delete image: ${error.message}`);
    }
  } catch (error) {
    throw error;
  }
}

export async function uploadSponsoredImage(
  file: File,
  userId: string
): Promise<string> {
  // Validate file type
  if (!file.type.startsWith("image/")) {
    throw new Error("Please select a valid image file (JPG, JPEG, PNG)");
  }

  // Validate file size (5MB max)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    throw new Error("File size must be less than 5MB");
  }

  // Generate a unique filename
  const fileExtension = file.name.split(".").pop();
  const uploadFileName = `${userId}-${Date.now()}.${fileExtension}`;

  try {
    // Upload file to Supabase Storage

    const { error } = await supabase.storage
      .from("universitySenior") // Make sure this bucket exists in your Supabase Storage
      .upload(`sponsored/${uploadFileName}`, file, {
        cacheControl: "3600",
        upsert: true, // Allow overwriting
      });

    if (error) {
      throw new Error(`Failed to upload image: ${error.message}`);
    }

    // Get the public URL
    const {
      data: { publicUrl },
    } = supabase.storage
      .from("universitySenior")
      .getPublicUrl(`sponsored/${uploadFileName}`);

    return publicUrl;
  } catch (error) {
    throw error;
  }
}

export async function deleteSponsoredImage(filePath: string): Promise<void> {
  try {
    // Extract the file path from the URL
    const pathParts = filePath.split("/");
    const fileName = pathParts[pathParts.length - 1];
    const relativePath = `sponsored/${fileName}`;

    const { error } = await supabase.storage
      .from("universitySenior")
      .remove([relativePath]);

    if (error) {
      throw new Error(`Failed to delete image: ${error.message}`);
    }
  } catch (error) {
    throw error;
  }
}
