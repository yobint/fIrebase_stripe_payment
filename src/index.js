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

import { getFirestore,
     doc,
     getDoc,
     updateDoc,
     setDoc,
     getDocs,
     collection,
     runTransaction
} from "firebase/firestore";


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

onAuthStateChanged(auth, user => {
    if(user != null) {
        console.log('logged in!');
        console.log(user);
        writeNewUser();
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
  
  const writeNewUser = async () => {
    const user = auth.currentUser;
  
    if (user) {
      console.log(user);
      const docData = {
        email: user.email,
        uid: user.uid,
        lastLogin: new Date(),
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
    } finally {
        writeNewUser();
    }
};

btnLogin.addEventListener("click", loginEmailPassword); 

const createAccount = async () =>  {
    const loginEmail = txtEmail.value;
    const loginPassword = txtPassword.value;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, loginEmail, loginPassword);
        const user = userCredential.user;
        return user;
    }
    catch(error) {
        console.log(error);
    } finally {
        writeNewUser();
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

btnInfo.addEventListener("click", async () => {
    const docSnap = await getUserDoc(db, auth.currentUser);
    let userData;
  
    if (docSnap.exists()) {
      userData = docSnap.data();
      console.log(`Email: ${userData.email}, UID: ${userData.uid}`);
    } else {
      console.log("No such document!");
    }
  });



 


