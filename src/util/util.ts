import Jimp from "jimp"
import fs from "fs"
import isURL from "validator/lib/isURL"

// filterImageFromURL
// helper function to download, filter, and save the filtered image locally
// returns the absolute path to the local image
// INPUTS
//    inputURL: string - a publicly accessible url to an image file
// RETURNS
//    an absolute path to a filtered image locally saved file
export async function filterImageFromURL(inputURL: string): Promise<string> {
  let photo: Jimp
  try {
    photo = await Jimp.read(inputURL)
  } catch (err) {
    console.error("Failed to read image because of the following error:", err)
    return Promise.reject(err)
  }
  const outpath = `filtered.${Math.floor(Math.random() * 2000)}.jpg`

  return new Promise((resolve) => {
    photo
      .resize(256, 256)
      .quality(60)
      .greyscale()
      .write(`${__dirname}${outpath}`, () => {
        resolve(`${__dirname}${outpath}`)
      })
  })
}

// deleteLocalFiles
// helper function to delete files on the local disk
// useful to cleanup after tasks
// INPUTS
//    files: Array<string> an array of absolute paths to files
export function deleteLocalFiles(files:Array<string>): void {
  for (const file of files) {
    fs.unlinkSync(file)
  }
}

/**
 * @name validateURL
 * @description Tests a string to confirm whether or not it's a valid URL.
 * @param {string} url - the string to test.
 * @returns {boolean} - returns true if the string is a valid URL. Returns
 * false if it isn't.
 */
export const validateURL = (url: string): boolean => {
  // I thought of getting a failsafe regex from Stackoverflow but most of the top
  // answers are over 3 years old and are probably not regularly updated by their
  // authors. So I decided to install a well-maintained and popular dependency instead.
  // And I decided to use validator.isURL() inside a function instead of calling it
  // directly because I wanted to abstract away how I validate URLs. So tomorrow I
  // could switch to using regex, but the function for validating URLs will remain the same.
  return isURL(
    url,
    {
      protocols: [ "http", "https" ],
      allow_protocol_relative_urls: true,
    }
  )
}
