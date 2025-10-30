import { Route } from 'react-router-dom';
import { Router } from '../../../lib/electron-router-dom';
import { Home } from '@renderer/pages/home';
import { NotFound } from '../pages/not-found';
import { Settings, Params } from '../pages/settings';
import { About } from '../pages/about';
import { ListClouds } from '../pages/clouds/list-clouds';
import { Cloud } from '../pages/clouds/cloud';
import { ListAccounts } from '../pages/clouds';
import { ListTargets } from '../pages/clouds/targets';
import { Protected } from './outlets/protected';

export function Routes() {
  return (
    <Router
      _providerProps={{
        fallbackElement: (
          <div className="flex w-full h-screen items-center justify-center">
            <h1 className="title text-3xl">Loading...</h1>
          </div>
        ),
      }}
      main={
        <Route path="/" element={<Protected />}>
          <Route path="/" element={<ListClouds />} />
          <Route path="/clouds" element={<ListClouds />} />
          <Route path="/targets" element={<ListTargets />} />
          <Route path="/cloud/:id" element={<Cloud />} />
          <Route path="/list-accounts/:cloud_id" element={<ListAccounts />} />

          <Route path="/home" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/settings/customize" element={<Settings />} />
          <Route path="/settings/params" element={<Params />} />

          <Route path="*" element={<NotFound />} />
        </Route>
      }
    />
  );
}
