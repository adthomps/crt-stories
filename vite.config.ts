import react from '@vitejs/plugin-react';
import vike from 'vike/plugin';
import { defineConfig } from 'vite';

import path from 'path';

export default defineConfig({
  plugins: [react(), vike()],
  resolve: {
    alias: {
      src: path.resolve(__dirname, 'src'),
    },
  },
});
