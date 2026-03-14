export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  phone: string;
  location: string;
}

export interface Pet {
  id: string;
  ownerId: string;
  name: string;
  type: string;
  breed: string;
  age: number;
  weight: string;
  gender: string;
  image: string;
  microchipId?: string;
  bloodGroup?: string;
  medicalHistory?: {
    date: string;
    title: string;
    description: string;
  }[];
}

export interface Appointment {
  id: string;
  petId: string;
  vetId: string;
  date: string;
  time: string;
  reason: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface Vet {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  image: string;
  clinicName: string;
  distance: string;
  about: string;
  address?: string;
  contactNumber?: string;
  latitude?: number | string;
  longitude?: number | string;
  availability?: string[];
}

export interface Adoption {
  id: string;
  name: string;
  type: string;
  breed: string;
  age: string;
  gender: string;
  shelter: string;
  image: string;
  description: string;
  weight?: string;
}

export interface Post {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  userName: string;
  userAvatar: string;
  image?: string;
  images?: string[];
  content: string;
  likes: number;
  likedBy?: string[];
  comments: number;
  category: 'general' | 'health' | 'training' | 'stories' | 'lost_found';
  petId?: string;
  lostPetId?: string;
  location?: string;
  timeAgo: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  recipient: string;
  sender: {
    id: string;
    name: string;
    avatar: string;
  };
  type: 'like' | 'comment' | 'reply' | 'adoption' | 'alert';
  post?: {
    id: string;
    content: string;
    image?: string;
  };
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface LostAndFound {
  id: string;
  type: 'lost' | 'found';
  petName?: string;
  breed: string;
  color: string;
  lastSeenLocation: string;
  lastSeenDate: string;
  location: string;
  date: string;
  description: string;
  image: string;
  reportedBy: any;
  status: 'active' | 'resolved' | 'Lost' | 'Found';
  contactInfo?: {
    phone: string;
    email: string;
  };
  createdAt: string;
}

export interface Emergency {
  id: string;
  userId: string;
  petId?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  latitude?: number;
  longitude?: number;
  status: 'pending' | 'accepted' | 'resolved' | 'cancelled';
  description?: string;
  assignedVetId?: string;
  emergencyType?: string;
  createdAt: string;
}
