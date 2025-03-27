import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../conn/connection";

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "3f59feb3b63f65dc451c3eee55e1f71ace444189e37fa57c550190790084ef137596ffd8b8561fc1dc72da53195b17cb057bfce6133f79b8284c75e6d9603e00";
export async function getAllUsers(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): Promise<void> {
  try {
    const users = await prisma.user.findMany();

    // If no users, return an empty array
    res.status(200).json({data: users || []});
  } catch (error) {
    next(error); // Pass error to the next middleware
  }
}

export async function getSingleUser(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const id = parseInt(req.params.id);

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: id,
      },
    });

    if (!user) {
      const error = new Error(`User with ID ${id} does not exist`);
      return next(error); // Pass the error to the next middleware
    }

    res.status(200).json(user);
  } catch (error) {
    next(error); // If there's an error with the Prisma query, pass it to the next middleware
  }
}

export async function postUser(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  try {
    const { name, password, email, reason } = req.body;
    console.log(req.body)

    if (!name || !email || !password || !reason) {
      const error = new Error("Fill all fields");
      return next(error);
    }
    const userExist = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (userExist) {
      res.status(400).json({ msg: "user already exist" });
      return;
    }
    //hashpassword
    const hashpassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        reason,
        password: hashpassword,
      },
    });

    res.status(201).json({
      message: "success",
      data: user,
    });
  } catch (error) {
    next(error);
  }
}
//login
export async function Login(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const { email, password } = req.body;
    console.log(req.body);
    console.log(email, password);

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    console.log(user, "user------------");
    if (!user) {
      res.status(404).json({ msg: "User doesnt exist" });
      return;
    }
    //console.log(user, "the user D")
    //verify password
    const isPasswordValid = await bcrypt.compare(password, user!.password!);
    if (!isPasswordValid) {
      res.status(400).json({ msg: "Invalid password" });
      return;
    }
    //generate jwt token
    const token = jwt.sign(
      { id: user?.id, email: user?.email, role: user?.role },
      JWT_SECRET,
      { expiresIn: "2h" }
    );
    res.status(200).json({ user, token });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "internal server error" });
  } finally {
    await prisma.$disconnect();
  }
}
// export async function postUser(req: express.Request, res: express.Response, next: express.NextFunction) {
//     try {

//         const { name, password, email } = req.body;

//         if (!name || !email || !password) {
//             const error = new Error("Fill all fields");
//             return next(error);
//         }

//         const user = await prisma.user.create({
//             data: { name, password, email },
//         });

//         res.status(201).json(user);
//     } catch (error) {
//         next(error);
//     }
// }

export async function updateUser(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const { name, email, role } = req.body;
  const id = parseInt(req.params.id);
  console.log(req.body,name, email, role ,id,"-------------------------------------------user-------------------------------");
  try {
    // Find the user by ID
    const user = await prisma.user.findUnique({
      where: { id: id },
    });

    // If the user doesn't exist, return a 404 error
    if (!user) {
      const error = new Error(`User with ID ${id} not found`);
      res.status(400).json(`user id ${id} doesn't exist`);
      return next(error);
    }
 // Convert role to uppercase to match the Prisma enum
 const normalizedRole = role ? role.toUpperCase() : user.role
    // Update the user data
    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: {
        name: name || user.name, // Only update the fields that are provided
        email: email || user.email,
        //password: password || user.password,
        role: normalizedRole || user.role,
      },
    });

    // Return the updated user
    res.status(201).json(updatedUser);
  } catch (error) {
    // Handle any errors
    console.error(error);
    next(error);
  }
}

export async function deleteUser(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const id = parseInt(req.params.id);
  //console.log(req.body);
  //console.log(id, "the id");

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: id,
      },
    });
    if (!user) {
      const error = new Error(`user id ${id} not found`);
      return next(error);
    }
    const userDeleted = await prisma.user.delete({
      where: {
        id: id,
      },
    });
    res.status(200).json({ message: `user id ${id} deleted succesfully` });
  } catch (error) {
    next(error);
  }
}


