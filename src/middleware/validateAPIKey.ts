import {NextFunction, Request, Response} from "express"
import {config as loadEnvironmentVariables} from "dotenv"
import {verify as verifyJWT} from "jsonwebtoken"

loadEnvironmentVariables()

const validateAPIKey = (req: Request, res: Response, next: NextFunction): Response => {
  const {api_key: apiKey} = req.query
  if (!apiKey) {
    return res.status(400).json({error: "No API key was supplied."})
  }

  if (typeof apiKey !== "string") {
    return res.status(400).json({error: "API key must be a string."})
  }

  verifyJWT(apiKey, process.env.JWT_SECRET, (err) => {
    if (err) {
      return res.status(500).json({auth: false, error: "Invalid API key."})
    }

    return next()
  })
}

export default validateAPIKey
