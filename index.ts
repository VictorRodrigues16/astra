// Deve ser o primeiro import do app (requisito do react-native-gesture-handler).
import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent chama AppRegistry.registerComponent('main', () => App)
// e garante que o ambiente esteja configurado para Expo Go e builds nativas.
registerRootComponent(App);
