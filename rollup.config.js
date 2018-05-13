import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import uglify from 'rollup-plugin-uglify';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';

const prod = process.env.NODE_ENV === 'production';

const prodPlugins = [uglify()];

const devPlugins = [
  serve()
  // livereload({ watch: ['dist', 'styles'], port: 4747 })
];

const mainEntry = {
  input: 'src/index.js',
  output: {
    file: 'dist/aura.js',
    format: 'umd',
    name: 'Aura'
  },
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

const workerEntry = {
  input: 'src/tokenizer-worker.js',
  output: {
    file: 'dist/tokenizer-worker.js',
    format: 'umd',
    name: 'Aura'
  },
  plugins: [
    resolve(),
    commonjs({
      include: 'node_modules/**'
    }),
    babel({
      exclude: 'node_modules/**'
    })
  ]
};

export default mainEntry; //[mainEntry, workerEntry];
