import {
  Dispatch,
  ReactElement,
  ReactNode,
  SetStateAction,
  useEffect,
  useState,
} from 'react';

import { Auth } from 'aws-amplify';
import { AuthState } from '@aws-amplify/ui-components';

import { SignUp } from '../components';

// import { User } from '../types';

interface Props {
  setUser: Dispatch<SetStateAction<any>>;
  children: ReactNode;
  isLoggedIn: boolean;
}
const Authenticator = (props: Props): ReactElement => {
  const { children, setUser, isLoggedIn } = props;
  const [screen, setScreen] = useState(AuthState.SignIn);

  const checkUser = async (retry, tryCnt = 1): Promise<void> => {
    const tryLimit = 3;
    console.log('[checkUser retryflag]', retry);
    try {
      const user = await Auth.currentAuthenticatedUser();
      console.log('[user:Auth]', user);
      setScreen(AuthState.SignedIn);
      setUser(user);
    } catch (e) {
      console.log('[error in checkUser]', e);
      if (retry === true && tryLimit > tryCnt) {
        setTimeout(() => {
          checkUser(retry, tryCnt + 1);
        }, 1000);
      }
    }
  };

  useEffect(() => {
    checkUser(true);
  }, []);

  const toSignUp = (): void => {
    setScreen(AuthState.SignUp);
  };
  const toSignInGoogle = async (): Promise<void> => {
    try {
      //@ts-ignore
      const res = await Auth.federatedSignIn({ provider: 'Google' });
      console.log('res', res);
      setUser(res);
    } catch (e) {
      console.log('[error in google]', e);
      await checkUser(true);
    }
  };
  const toSignInFacebook = async (): Promise<void> => {
    try {
      //@ts-ignore
      const res = await Auth.federatedSignIn({ provider: 'Facebook' });
      console.log('res', res);
      setUser(res);
    } catch (e) {
      console.log('[error in facebook]', e);
      await checkUser(true);
    }
  };

  const checkUserEvt = async (): Promise<void> => {
    await checkUser(false);
  };

  const toSignOut = (): void => {
    Auth.signOut();
    console.log('signout');
  };

  const bgClass = isLoggedIn ? `` : `bg-dark`;
  return (
    <div
      className={`fullscreen ${bgClass} d-flex justify-content-center align-items-center`}
    >
      {screen === AuthState.SignedIn ? (
        children
      ) : screen === AuthState.SignUp ? (
        <div> <SignUp /> </div>
      ) : (
            <>
              <div className={`btn btn-info`} onClick={toSignUp}>
                signup
            </div>
              <div className={`btn btn-danger`} onClick={toSignInGoogle}>
                signin(google)
            </div>
              <div className={`btn btn-primary`} onClick={toSignInFacebook}>
                signin(facebook)
            </div>
              <div className={`btn btn-dark`} onClick={checkUserEvt}>
                check user in console
            </div>
              <div className={`btn btn-warning`} onClick={toSignOut}>
                signout
            </div>
            </>
          )}
      <style global jsx>{`
          .fullscreen {
            height: 100vh;
            width: 100vw;
          }
        `}</style>
    </div>
  );
};

export { Authenticator };