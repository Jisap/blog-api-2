import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser {
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  firstName: string;
  lastName?: string;
  socialLinks?: {
    website?: string;
    facebook?: string;
    x?: string;
    instagram?: string;
    youtube?: string;
    linkedin?: string;
  }
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      maxLength: [20, 'Username must be less than 20 characters long'],
      unique: [true, 'Username already exists']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      maxLength: [50, 'Email must be less than 50 characters long'],
      unique: [true, 'Email already exists']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      enum: {
        values: ['admin', 'user'],
        message: '{VALUE} is noy supported'
      },
      default: 'user'
    },
    firstName: {
      type: String,
      maxLength: [20, 'First name must be less than 20 characters long'],
    },
    lastName: {
      type: String,
      maxLength: [20, 'Last name must be less than 20 characters long'],
    },
    socialLinks: {
      website: {
        type: String,
        maxLength: [100, 'Website URL must be less than 100 characters long']
      },
      facebook: {
        type: String,
        maxLength: [100, 'Facebook URL must be less than 100 characters long']
      },
      x: {
        type: String,
        maxLength: [100, 'X URL must be less than 100 characters long']
      },
      instagram: {
        type: String,
        maxLength: [100, 'Instagram URL must be less than 100 characters long']
      },
      youtube: {
        type: String,
        maxLength: [100, 'Youtube URL must be less than 100 characters long']
      },
      linkedin: {
        type: String,
        maxLength: [100, 'Linkedin URL must be less than 100 characters long']
      },
    },
  }, {
  timestamps: true
}
);

// Define un "hook" que se ejecutará ANTES del evento 'save' en cualquier documento de este esquema.
// 'this' se refiere al documento de usuario que está a punto de ser guardado.
// 'isModified('password')' comprueba si el campo 'password' ha sido modificado.

userSchema.pre('save', async function () {
  if (!this.isModified('password')) {                        // Si se actualiza algún campo distinto a 'password'
    return;                                                  // no se ejecuta el hash de la contraseña 
  }

  this.password = await bcrypt.hash(this.password, 10);     // Si se actualiza el campo 'password', se ejecuta el hash de la contraseña
});

export default model<IUser>('User', userSchema)