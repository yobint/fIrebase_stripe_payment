
import { getStorage,
    ref,
    uploadBytes,
    getDownloadURL} from 'firebase/storage';

const storage = getStorage(firebaseApp, "gs://projeto-01-42f74.appspot.com");

const uploadFile = async (): Promise<string> => {
    const fileInput = document.getElementById("fileInput") as HTMLInputElement;
    const file = fileInput.files?.[0];
  
    if (!file) {
      throw new Error('File is required');
    }
  
    const fileName = file.name;
    const fileExtension = fileName.split('.').pop() ?? ''
      
    if (!['jpg', 'jpeg', 'png', 'pdf'].includes(fileExtension)) {
      throw new Error('Invalid file format');
    }
  
    const storageRef = ref(storage, `files/${fileName}`);
    const snapshot = await uploadBytes(storageRef, file);
    const url = await getDownloadURL(snapshot.ref);
  
    return url;
  };