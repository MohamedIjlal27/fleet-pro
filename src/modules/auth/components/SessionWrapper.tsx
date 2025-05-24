import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser } from '../../../redux/features/user/userSelector';

const SessionWrapper = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  useEffect(() => {
    console.log('user from SessionWrapper:',user);
    if (!user) {
        //navigate('/login');
    }
  }, [user, dispatch, navigate]);

  return user? children : null;
};

export default SessionWrapper;