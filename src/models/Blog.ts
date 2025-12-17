import { genSlug } from "@/utils";
import { model, Schema, Types } from "mongoose";

export interface IBlog {
  title: string;
  slug: string;
  content: string;
  banner: {
    publicId: string;
    url: string;
    width: number;
    height: number;
  };
  author: Types.ObjectId;
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  status: "draft" | "published";
}

const blogSchema = new Schema<IBlog>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      maxLength: [180, "Title must be less than 180 characters long"],
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
    banner: {
      publicId: {
        type: String,
        required: [true, "Public ID is required"],
      },
      url: {
        type: String,
        required: [true, "URL is required"],
      },
      width: {
        type: Number,
        required: [true, "Width is required"],
      },
      height: {
        type: Number,
        required: [true, "Height is required"],
      },
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author is required"],
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: {
        values: ["draft", "published"],
        message: '{VALUE} is not supported',
      },
      default: "draft",
    },
  }, { timestamps: { createdAt: "publishedAt" } }
);

blogSchema.pre("validate", async function () {      // Antes de guardar el blog
  if (this.title && !this.slug) {                   // Si el titulo existe pero el slug no 
    this.slug = genSlug(this.title);                // Genera el slug 
  }

  // No es necesario llamar a next() ya que el middleware es async. Mogoose detecta automaticamente si devuelves una promesa.
})

export default model<IBlog>("Blog", blogSchema);