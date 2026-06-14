import mongoose from 'mongoose';

const translationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    inputLanguage: { type: String, required: true },
    outputLanguage: { type: String, required: true },
    originalText: { type: String, required: true },
    translatedText: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export default mongoose.model('Translation', translationSchema);
