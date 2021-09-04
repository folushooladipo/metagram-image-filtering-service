import express, {json as parseJsonBody} from "express"

import {deleteLocalFiles, filterImageFromURL, validateURL} from "./util/util";

(() => {
  const app = express()

  const port = process.env.PORT || 8082

  app.use(parseJsonBody())

  app.get("/filteredimage", async (req, res) => {
    const {image_url: imageURL} = req.query
    if (!imageURL) {
      return res
        .status(400)
        .send("Error: an image URL was not supplied.")
    }
    if (typeof imageURL !== "string") {
      return res
        .status(400)
        .send("Error: image URL must be a string.")
    }

    // TODO: try turning off this URL validation and see what filterImageFromURL() does
    // when given an invalid URL or a URL to an image that can't be accessed for some reason.
    const isImageURLValid = validateURL(imageURL)
    if (!isImageURLValid) {
      return res
        .status(400)
        .send("Error: the image URL supplied is not a valid URL.")
    }

    let pathToFilteredImage: string
    try {
      pathToFilteredImage = await filterImageFromURL(imageURL)
    } catch (err) {
      console.error("Failed to filter image because of this error:", err)
      return res
        .status(500)
        .send("There was a problem fetching your image. Please check the URL and try again.")
    }

    res.sendFile(pathToFilteredImage, (err) => {
      if (err) {
        console.error("Failed to send filtered image because of this error:", err)
      }

      deleteLocalFiles([pathToFilteredImage])
    })
  })

  app.get("/", (req, res) => {
    res.send("This is the root route and it doesn't do much. Instead, try sending a request as: GET /filteredimage?image_url=SOME_URL")
  })

  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running at http://localhost:${port}`)
    // eslint-disable-next-line no-console
    console.log(`Press CTRL+C to stop server.`)
  })
})()
