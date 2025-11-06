
import { supabase } from './db'
import { v4 as uuidv4 } from 'uuid'

export async function uploadScanImage(fileBuffer: Buffer, extension = "jpg") {
  try {
    const id = uuidv4()
    const fileName = `${id}.${extension}`

    const { data, error } = await supabase.storage
      .from('scans')
      .upload(fileName, fileBuffer, {
        contentType: `image/${extension}`,
        upsert: false
      })

    if (error) throw error

    const { data: publicUrl } = supabase.storage
      .from('scans')
      .getPublicUrl(fileName)

    return {
      url: publicUrl.publicUrl,
      path: fileName
    }
  } catch (err) {
    console.error("Upload Error:", err)
    return null
  }
}
