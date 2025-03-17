import { supabase } from './supabase'

/**
 * Ensures that the 'images' bucket exists in Supabase storage
 * This function should be called during app initialization
 */
export async function ensureImagesBucketExists() {
  try {
    // Check if the bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('Error listing buckets:', listError)
      return false
    }
    
    // Check if the images bucket exists
    const imagesBucket = buckets.find(bucket => bucket.name === 'images')
    
    if (!imagesBucket) {
      // Create the images bucket if it doesn't exist
      const { error: createError } = await supabase.storage.createBucket('images', {
        public: true, // Make the bucket public so images can be accessed without authentication
        fileSizeLimit: 5242880, // 5MB limit
      })
      
      if (createError) {
        console.error('Error creating images bucket:', createError)
        return false
      }
      
      console.log('Created images bucket in Supabase storage')
    } else {
      console.log('Images bucket already exists in Supabase storage')
    }
    
    return true
  } catch (error) {
    console.error('Error ensuring images bucket exists:', error)
    return false
  }
} 