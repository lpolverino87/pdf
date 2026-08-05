import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';

import { Layout } from '@/components/layout';

import { Dashboard } from '@/pages/dashboard';
import { ComuniList } from '@/pages/comuni';
import { ComuneDetail } from '@/pages/comuni/detail';
import { ComuneForm } from '@/pages/comuni/form';
import { CrematoriList } from '@/pages/crematori';
import { CrematorioDetail } from '@/pages/crematori/detail';
import { CrematorioForm } from '@/pages/crematori/form';
import { NazioniList } from '@/pages/nazioni';
import { NazioneDetail } from '@/pages/nazioni/detail';
import { NazioneForm } from '@/pages/nazioni/form';
import { ModuliList } from '@/pages/moduli';
import { ModuloForm } from '@/pages/moduli/form';

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        
        <Route path="/comuni" component={ComuniList} />
        <Route path="/comuni/new" component={ComuneForm} />
        <Route path="/comuni/:id/edit" component={ComuneForm} />
        <Route path="/comuni/:id" component={ComuneDetail} />
        
        <Route path="/crematori" component={CrematoriList} />
        <Route path="/crematori/new" component={CrematorioForm} />
        <Route path="/crematori/:id/edit" component={CrematorioForm} />
        <Route path="/crematori/:id" component={CrematorioDetail} />
        
        <Route path="/nazioni" component={NazioniList} />
        <Route path="/nazioni/new" component={NazioneForm} />
        <Route path="/nazioni/:id/edit" component={NazioneForm} />
        <Route path="/nazioni/:id" component={NazioneDetail} />
        
        <Route path="/moduli" component={ModuliList} />
        <Route path="/moduli/new" component={ModuloForm} />
        <Route path="/moduli/:id/edit" component={ModuloForm} />
        
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
