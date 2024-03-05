import { initializeApp } from 'firebase/app';
import {
    getAuth,
    onAuthStateChanged, 
    connectAuthEmulator, 
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    deleteUser
} from 'firebase/auth';

import { 
     getFirestore,
     doc,
     getDoc,
     updateDoc,
     setDoc,
     getDocs,
     collection,
     runTransaction
} from "firebase/firestore";

import { 
      getStorage,
      ref,
} from "firebase/storage";


const firebaseApp = initializeApp({
    apiKey: "AIzaSyB0jgNjEtTwEMhOv6AIoYAkEbYSmfeNhy4",
    authDomain: "projeto-01-42f74.firebaseapp.com",
    projectId: "projeto-01-42f74",
    storageBucket: "projeto-01-42f74.appspot.com",
    messagingSenderId: "256012644284",
    appId: "1:256012644284:web:38ef5cf3439f2cf5be45b9"
});

const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);
const storage = getStorage(firebaseApp, "gs://projeto-01-42f74.appspot.com");


onAuthStateChanged(auth, user => {
    if(user != null) {
        console.log('logged in!');
        console.log(user);
    } else {
        console.log('No user');
    }
});

const monitorAuthState = async () => {
    return new Promise((resolve) => {
      onAuthStateChanged(auth, (user) => {
        if (user != null) {
          console.log("logged in");
          console.log(user);
          resolve(true);
        } else {
          console.log("no user");
          resolve(false);
        }
      });
    });
  };

const firestore = getFirestore();

const newUser = doc(firestore, 'userInfo/userList');
  
const writeNewUser = async (name, phone, cpf) => {
  const user = auth.currentUser;

    if (user) {
      console.log(user);
      const docData = {
        name: name || user.displayName,
        email: user.email,
        uid: user.uid,
        phone: phone || user.phoneNumber,
        cpf: cpf,
    };
    try {
      const userDocRef = doc(db, 'userInfo/', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        await updateDoc(userDocRef, docData);
      } else {
        await setDoc(userDocRef, docData);
      }
    } catch (error) {
      console.log('Error writing user data:', error);
    }
  } else {
    console.log("No user logged in");
  }
};

const loginEmailPassword = async () => {
    const loginEmail = txtEmail.value;
    const loginPassword = txtPassword.value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
        console.log("Logged in:", userCredential.user);

    }
    catch(error) {
        console.log(error);
    }
};

btnLogin.addEventListener("click", loginEmailPassword);

const isValidNumber = (value) => {
  const number = Number(value);
  return !isNaN(number) && Number.isFinite(number);
}; 

const createAccount = async () =>  {
    const loginEmail = txtEmail.value;
    const loginPassword = txtPassword.value;
    const name = txtName.value;
    const phone = txtPhone.value;
    const cpf = txtCPF.value;

    if (!isValidNumber(phone)) {
      console.error('Phone number must be a valid number');
      return;
    }
  
    if (!isValidNumber(cpf)) {
      console.error('CPF must be a valid number');
      return;
    }
  

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, loginEmail, loginPassword);
        const user = userCredential.user;
        return user;
    }
    catch(error) {
        console.log(error);
    } finally {
      writeNewUser(name, phone, cpf);
    }
};

btnSignup.addEventListener("click", createAccount);

const logout = async () => {
    await signOut(auth);
};

btnLogout.addEventListener("click", logout);

/* revisar função deleteAccount [sugestão do blackbox]*/
const deleteAccount = async () => {
    const user = auth.currentUser;

    if (user) {
      try {
        // Delete user data from Firestore
        await runTransaction(db, async (transaction) => {
          const userDocRef = doc(db, 'userInfo', user.uid);
          const userDocSnap = await transaction.get(userDocRef);

          if (userDocSnap.exists()) {
            transaction.delete(userDocRef);
          } else {
            throw new Error('User document does not exist');
          }
        });

        // Delete user's authentication account
        await deleteUser(user);

        console.log('User account and data deleted successfully');
      } catch (error) {
        console.error('Error deleting user account and data:', error);
      }
    } else {
      console.log("No user logged in");
    }
};

btnSignout.addEventListener("click", deleteAccount);

/* revisar botão Info [sugestão do blackbox]*/
const getUserDoc = async (db, user) => {
    const userDocRef = doc(db, 'userInfo', user.uid);
    const userDocSnap = await getDoc(userDocRef);
  
    if (userDocSnap.exists) {
      return userDocSnap.data();
    } else {
      throw new Error('User document does not exist');
    }
  };

btnInfo.addEventListener("click", async () => {
  try {
    const userDocSnap = await getDoc(doc(db, 'userInfo', auth.currentUser.uid));
    const userData = userDocSnap.data();
    console.log(`Name: ${userData.name}, Email: ${userData.email}, UID: ${userData.uid}, CPF: ${userData.cpf}, Phone: ${userData.phone} ` );
  } catch (error) {
    console.error('Error getting user data:', error);
  }
});

/* revisar função updateUserFields >> sugestão de kusanali*/

const updateUserField = (uid, field, value) => {
  const docData = {};
  docData[field] = value;

  const userDocRef = doc(db, 'userInfo/', uid);
  getDoc(userDocRef)
    .then((userDocSnap) => {
      if (userDocSnap.exists) {
        updateDoc(userDocRef, docData);
      } else {
        throw new Error('User document does not exist');
      }
    })
    .catch((error) => {
      console.error('Error updating user field:', error);
    });
};

const updateUser = () => {
  const uid = auth.currentUser.uid;
  const name = txtName.value;
  const phone = txtPhone.value;

  if (name) {
    updateUserField(uid, 'name', name);
  }

  if (phone) {
    updateUserField(uid, 'phone', phone);
  }
};

btnUpdate.addEventListener("click", updateUser);


/*Sugestões de kusanali para Cloud Storage
// Get a reference to the root of the storage syst
const bucketName = 'projeto-01-42f74.appspot.com';
const filePath = 'file.jpg';
const storageRef = ref(storage, filePath);
const uploadTask = uploadBytesResumable(storageRef, file);

// Construct the upload URL
const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o?name=${filePath}`;

// Upload the file to Cloud Storage
uploadTask.on('state_changed', (snapshot) => {
  // Handle upload progress
}, (error) => {
  // Handle upload errors
}, () => {
  // Handle successful upload
  const downloadUrl = uploadTask.snapshot.ref.getDownloadURL();
  console.log('Download URL:', downloadUrl);
});

// Upload a file to the 'images/space.jpg' reference
const fileInput = document.getElementById('fileInput');
const file = fileInput.files[0];
uploadFileToCloudStorage(file, spaceRef)
  .then(() => {
    console.log('File uploaded successfully');
  })
  .catch((error) => {
    console.error('Error uploading file:', error);
  });*/

  /* FUNÇÂO ÙTIL PARA ATUALIZAR UM DOCUMENTO [incialmente o documento userList na coleção userInfo]
const writeNewUser = async () => {
    const user = auth.currentUser;
  
    if (user) {
      console.log(user);
      const docData = {
        [user.uid]: {
          email: user.email,
          lastLogin: new Date(),
        },
      };
  
      try {
        const userDocRef = doc(db, 'userInfo', 'userList');
        const userDocSnap = await getDoc(userDocRef);
  
        if (userDocSnap.exists()) {
          await updateDoc(userDocRef, {
            ...userDocSnap.data(),
            ...docData,
          });
        } else {
          await setDoc(userDocRef, docData);
        }
      } catch (error) {
        console.log('Error writing user data:', error);
      }
    } else {
      console.log("No user logged in");
    }
  };*/
