const UserModel = require("../models/user.model");
const fs = require("fs");
const { promisify } = require("util");
const pipeline = promisify(require("stream").pipeline);
const { uploadErrors } = require("../utils/errors.utils");
const { Readable } = require('stream');

module.exports.uploadProfil = async (req, res) => {
  try {

    if (
      req.file.mimetype != "image/jpg" &&
      req.file.mimetype != "image/png" &&
      req.file.mimetype != "image/jpeg"
    ) 
      throw Error("invalid file");

    if (req.file.size > 500000) throw Error("max size");

  } catch (err) {
    const errors = uploadErrors(err);
    return res.status(201).json({ errors });
  }
  
  //const fileName = req.body.name + ".jpg";
  const fileName = "azerty.jpg";

     await pipeline(
    Readable.from(req.file.buffer),
    fs.createWriteStream(
      `${__dirname}/../client/public/uploads/profil/${fileName}`
    )
  );   

   try {
    await UserModel.findByIdAndUpdate(
      req.body.userId,
        { $set: { picture: "./uploads/profil/" + fileName } },
        { new: true, upsert: true, setDefaultsOnInsert: true }),
        (err, docs) => {
          // .then((data) => res.send(data))
          // .catch((err) => res.status(500).send({ message: err })),
          if (err) return res.status(400).send(err);
        };
        // .then((data) => res.send(data))
        // .catch((err) => res.status(500).send({ message: err }));
        
  } catch (err) {
    return res.status(500).send({ message: err });
  }  
};