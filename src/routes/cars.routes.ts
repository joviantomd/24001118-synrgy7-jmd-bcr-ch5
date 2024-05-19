import { Router, Request, Response } from "express";
import knex from "knex";
import { CarsModel } from "../models/CarsModel";
import UploadImage from "../../middlewares/multer";
import cloudinary from "../../config/cloudinary";

const router = Router();

// GET cars;
router.get("/", async (_req: Request, res: Response) => {
  const cars = await CarsModel.query();

  res.status(200).json({
    message: "OK",
    cars,
  });
});

// GET specific car by ID.
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const getId: number = Number(req.params.id);
    const car = await CarsModel.query()
      .findById(Number(getId))
      .throwIfNotFound();

    res.status(200).json({
      car,
    });
  } catch (error) {
    res.status(404).json({
      message: "Data Not Found",
    });
  }
});

// CREATE
router.post("/create", UploadImage.single('image'), async (req: Request, res: Response) => {
  try{
    if (!req.file) {
      return res.status(400).json({message:'No Image Uploaded'});
    }

    const { buffer } = req.file;
    const fileBase64 = buffer.toString('base64');
    const fileData = `data:${req.file.mimetype};base64,${fileBase64}`;

    const upload = await cloudinary.uploader.upload(fileData || req.file.path, {
      folder: 'ch-5-challenge', // Adjust folder name as needed
      use_filename: true,
    });
    
    const idCar = Math.floor(Math.random() * 100);
    const {name, price, category, image, start_date, end_date, availability} = req.body || {};
  
    const createCar = await CarsModel.query().insert({
      id: idCar,
      name,
      price,
      category,
      image : upload.secure_url,
      start_date,
      end_date,
      availability,
      createdAt: new Date(),
      updatedAt: new Date()
    } as any);
  
    res.status(201).json({
      status: "OK",
      message: "Data successfully created!",
      data: createCar
    });

  } catch(error){
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
  

// UPDATE / EDIT.
router.put("/:id", UploadImage.single('image'),async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({message:'No Image Uploaded'});
    }

    const { buffer } = req.file;
    const fileBase64 = buffer.toString('base64');
    const fileData = `data:${req.file.mimetype};base64,${fileBase64}`;

    const upload = await cloudinary.uploader.upload(fileData || req.file.path, {
      folder: 'ch-5-challenge', // Adjust folder name as needed
      use_filename: true,
    });

    const { name, price, category, start_date, end_date, availability,} = req.body || {};

    const id: number = Number(req.params.id);
    const updateCar = await CarsModel.query().update({
        name,
        price,
        category,
        image: upload.secure_url,
        start_date,
        end_date,
        availability,
        updatedAt: new Date(),
      } as any)
      .where("id", id);

    res.status(201).json({
      message: "Data berhasil di update!",
      data : updateCar,
    });

  } catch (error) {
    res.status(404).json({
      message: "Data Tidak ditemukan",
    });
  }
});


//  DELETE
router.delete("/:id", async (req: Request, res: Response) => {
  const getId = Number(req.params.id);
  const deleteCar = await CarsModel.query().deleteById(getId);
  const filterById = await CarsModel.query().findById(Number(getId));

  res.status(200).json({
    status: "OK",
    message: "Item successfully deleted",
    deleteCar,
    cars: filterById,
  });
});

export default router;
