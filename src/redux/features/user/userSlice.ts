import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserState, SetUserPayload } from './userTypes';

const initialState: UserState = {
  id: 0,
  email: '',
  username: '',
  picture: '',
  organizationId: 0,
  firstName: '',
  lastName: '',
  roles: [],
  permissions: [],
  subscribedPlans: [],
  modules: {},
};

const userSlice = createSlice({
  name: 'user',
  initialState: initialState,
  reducers: {
    setUser: (state, action: PayloadAction<SetUserPayload>) => {
      state.id = action.payload.id;
      state.email = action.payload.email;
      state.username = action.payload.username;
      state.picture = action.payload.picture;
      state.organizationId = action.payload.organizationId;
      state.firstName = action.payload.firstName;
      state.lastName = action.payload.lastName;
      state.roles = action.payload.roles;
      state.permissions = action.payload.permissions;
      state.subscribedPlans = action.payload.subscribedPlans;
      state.modules = action.payload.modules;
    },
    clearUser: (state) => {
      state.id = 0;
      state.email = '';
      state.username = '';
      state.picture = '';
      state.organizationId = 0;
      state.firstName = '';
      state.lastName = '';
      state.roles = [];
      state.permissions = [];
      state.subscribedPlans = [],
      state.modules = {};
    },
    updateModule: (state, action: PayloadAction<{ moduleName: string; type: string }>) => {
      const { moduleName, type } = action.payload;
      state.modules[moduleName] = type;
    },
    removeModule: (state, action: PayloadAction<string>) => {
      const moduleName = action.payload;
      delete state.modules[moduleName];
    }
  },
});

export const { setUser, clearUser, updateModule, removeModule } = userSlice.actions;
export default userSlice.reducer;
