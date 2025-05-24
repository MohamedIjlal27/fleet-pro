import { RootState } from '../../app/store';

export const selectUser = (state: RootState) => {
  if (state.user && state.user.id === 0) {
    return null;
  }
  return state.user;
};