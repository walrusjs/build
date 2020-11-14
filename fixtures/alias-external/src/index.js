import { DEBUG } from '@/constants';
import tinyGlob from 'tiny-glob';

console.log('DEBUG should be true: ', DEBUG);

function b() {
  console.log(tinyGlob())
}

b();
