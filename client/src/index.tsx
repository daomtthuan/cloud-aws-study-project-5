import './index.css';
import 'semantic-ui-css/semantic.min.css';

import ReactDOM from 'react-dom';

import { makeAuthRouting } from './routing';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(makeAuthRouting(), document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
