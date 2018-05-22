import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import uglify from 'rollup-plugin-uglify';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import filesize from 'rollup-plugin-filesize';

// eslint-disable-next-line no-undef
const prod = process.env.NODE_ENV === 'production';

const prodOptions = {};
const prodPlugins = [uglify(), filesize()];

const devOptions = {
  watch: {
    chokidar: false,
    include: 'src/**'
  }
};

const devPlugins = [serve(), livereload({ watch: ['dist', 'styles'] })];

const mainEntry = {
  input: 'src/index.js',
  output: {
    file: 'dist/aura.js',
    format: 'umd',
    name: 'Aura'
  },
  ...(prod ? prodOptions : devOptions),
  plugins: [
    resolve(),
    commonjs({
      include: 'node_modules/**'
    }),
    babel({
      exclude: 'node_modules/**'
    }),
    ...(prod ? prodPlugins : devPlugins)
  ]
};

export default [mainEntry];
