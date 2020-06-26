import { AmplifyAuthenticator, AmplifySignUp } from '@aws-amplify/ui-react';
import { ReactElement, ReactNode, useEffect } from 'react';

import awsconfig from '../aws-exports';
// https://github.com/aws-amplify/amplify-js/issues/5825#issuecomment-631759616
import { onAuthUIStateChange } from '@aws-amplify/ui-components';

interface Props {
  children: ReactNode;
  onStateChange?: any;
  isLoggedIn: boolean;
}
const Authenticator = (props: Props): ReactElement => {
  const { children, onStateChange, isLoggedIn } = props;

  useEffect(() => {
    return onAuthUIStateChange((newAuthState, user) => {
      onStateChange(newAuthState, user);
    });
  }, []);

  const bgClass = isLoggedIn ? `` : `bg-dark`;
  return (
    <div
      className={`fullscreen ${bgClass} d-flex justify-content-center align-items-center`}
    >
      <AmplifyAuthenticator
        usernameAlias="email"
        federated={{ oauthConfig: awsconfig.oauth }}
      >
        <AmplifySignUp
          slot="sign-up"
          usernameAlias="email"
          formFields={[
            {
              type: 'email',
              label: 'Email',
              placeholder: 'input email',
              required: true,
            },
            {
              type: 'password',
              label: 'Password',
              placeholder: 'input password',
              required: true,
            },
          ]}
        />
        {children}
      </AmplifyAuthenticator>
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
