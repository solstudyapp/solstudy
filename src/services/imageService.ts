import { supabase } from "@/integrations/supabase/client"

/**
 * Service for handling image uploads to Supabase storage
 */
export const imageService = {
  /**
   * Upload an image to Supabase storage
   * @param file The file to upload
   * @returns The URL of the uploaded image
   */
  uploadImage: async (file: File): Promise<string> => {
    if (!file) {
      throw new Error('No file provided')
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('Invalid file type. Only images are allowed.')
    }
    
    // Generate a unique file name
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
    const filePath = `${fileName}`
    
    try {
      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })
      
      if (error) {
        console.error('Supabase storage upload error:', error)
        throw new Error('Failed to upload file to storage')
      }
      
      // Get the public URL
      const { data: urlData } = await supabase.storage
        .from('images')
        .getPublicUrl(filePath)

      return urlData.publicUrl
    } catch (error) {
      console.error("Error uploading image:", error)
      throw error
    }
  }
}
