import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import {StartupBoundary,Ready} from './startup';
import './style.css';
import {initializeSupabase} from './store';
void initializeSupabase().then(()=>{ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><StartupBoundary><Ready><App/></Ready></StartupBoundary></React.StrictMode>)});
