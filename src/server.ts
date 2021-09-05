import express, {json as parseJsonBody} from "express"
import {config as loadEnvironmentVariables} from "dotenv"
import {sign as signJWT} from "jsonwebtoken"

import {deleteLocalFiles, filterImageFromURL, validateURL} from "./util/util"
import {validateAPIKey} from "./middleware"

loadEnvironmentVariables()
const SECONDS_IN_ONE_YEAR = 60 * 60 * 24 * 365;

(() => {
  const app = express()

  const port = process.env.PORT || 8082

  app.use(parseJsonBody())

  app.get("/filteredimage", validateAPIKey, async (req, res) => {
    const {image_url: imageURL} = req.query
    if (!imageURL) {
      return res
        .status(400)
        .send("Error: an image URL was not supplied.")
    }
    if (typeof imageURL !== "string") {
      return res
        .status(422)
        .send("Error: image URL must be a string.")
    }

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
        .send("The image at the given URL isn't accessible. Please check the URL and try again.")
    }

    res.sendFile(pathToFilteredImage, (err) => {
      if (err) {
        console.error("Failed to send filtered image to client because of this error:", err)
      }

      deleteLocalFiles([pathToFilteredImage])
    })
  })

  const trustedSourceIDs = {
    [process.env.TRUSTED_SOURCE_LOCAL]: true,
    [process.env.TRUSTED_SOURCE_DEV]: true,
  }
  app.get("/apikey", (req, res) => {
    // A more practical but complicated way to do this would be to require a
    // JWT token in the request and then ask Metagram API if that token belongs
    // to a known user. If it did, an API key would be issued.
    const {sourceID} = req.query
    if (!sourceID) {
      return res
        .status(400)
        .json({
          error: "A source ID was not supplied.",
        })
    }

    if (typeof sourceID !== "string") {
      return res
        .status(422)
        .json({
          error: "Source ID must be a string.",
        })
    }

    if (!trustedSourceIDs[sourceID]) {
      return res
        .status(403)
        .json({
          error: "You are not permitted to generate an API key.",
        })
    }

    const payload = {
      time: Date.now(),
      randomNumber: Math.random(),
    }
    const secondsSinceUnixEpoch = Math.floor(Date.now() / 1000)
    const expiresIn = secondsSinceUnixEpoch + SECONDS_IN_ONE_YEAR
    const jwtToken = signJWT(
      payload,
      process.env.JWT_SECRET,
      {
        expiresIn,
      }
    )
    const expiresInMilliseconds = expiresIn * 1000
    res
      .json({
        token: jwtToken,
        expiryDate: (new Date(expiresInMilliseconds)).toISOString(),
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
