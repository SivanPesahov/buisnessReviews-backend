import { Schema, model, Document } from 'mongoose'; 

interface IBusiness extends Document { 
  name: string; 
  description: string; 
} 

const businessSchema = new Schema<IBusiness>({ 
  name: { 
    type: String, 
    required: true, 
    unique: true, 
  }, 
  description: { 
    type: String, 
    required: true, 
  }, 
}); 

const Business = model<IBusiness>('Business', businessSchema); 

export default Business;


