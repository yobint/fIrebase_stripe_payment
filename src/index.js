import { initializeApp } from 'firebase/app';
import {
    getAuth,
    onAuthStateChanged, 
    connectAuthEmulator, 
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut
} from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc, setDoc} from "firebase/firestore";


const firebaseApp = initializeApp({
    apiKey: "AIzaSyB0jgNjEtTwEMhOv6AIoYAkEbYSmfeNhy4",
    authDomain: "projeto-01-42f74.firebaseapp.com",
    projectId: "projeto-01-42f74",
    storageBucket: "projeto-01-42f74.appspot.com",
    messagingSenderId: "256012644284",
    appId: "1:256012644284:web:38ef5cf3439f2cf5be45b9"
});

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

/*onAuthStateChanged(auth, user => {
    if(user != null) {
        console.log('logged in!');
        console.log(user);
        writeNewUser();
    } else {
        console.log('No user');
    }
});*/

/* antes da sugestão do blackbox-3
connectAuthEmulator(auth, "http://localhost:9099"); 
const monitorAuthState = async () => {
    onAuthStateChanged(auth, user => {
        if (user != null) {
            console.log('logged in')
            console.log(user);
        }
        else {
            console.log("no user");
        };
    })
};

monitorAuthState();*/

/* blackbox-2
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
  };*/


const db = getFirestore(firebaseApp);
const firestore = getFirestore();

const newUser = doc(firestore, 'userInfo/userList');
/* blackbox-2 
function writeNewUser() {
    const user = auth.currentUser;
    if (user) {
        console.log(user)
        const docData = {
            email: "user.email",
            uid: "user.uid"
        };
        setDoc(newUser, docData, { merge: true });
    } else {
        console.log("No user logged in");
    }
};*/

function writeNewUser() {
    const user = auth.currentUser;

    console.log(user)
    const docData = {
        email: user.email,
        uid: user.uid
    };
    setDoc(newUser, docData, { merge: true });
};

/* função editada pelo blackbox, mas falhou
function writeNewUser() {
    const user = auth.currentUser;
    if (!user) {
        console.log("No user logged in");
        return;
    } else {
        const docData = {
            email: user.email,
            uid: user.uid,
        };
        updateDoc(newUser, docData, { merge: true});
        console.log('Na base de dados.')
    };
}*/

/* função para ler userList, também falhou -- incompleta--
async function readASingleDocument() {
    const mySnapshot = await getDoc();
    if (mySnapshot.exists()) {
    const docData = mySnapshot.data();
    console.log(docData);
    }
}*/

const loginEmailPassword = async () => {
    const loginEmail = txtEmail.value;
    const loginPassword = txtPassword.value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
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
        const user = userCredential.user
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


