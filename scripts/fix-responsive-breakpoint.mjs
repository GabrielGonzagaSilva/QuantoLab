import fs from 'node:fs';

const file='style.css';
const css=fs.readFileSync(file,'utf8');
const from='@media (max-width:360px)';
const to='@media (max-width:380px)';
const count=css.split(from).length-1;
if(count!==1) throw new Error(`Expected one ${from}, found ${count}`);
fs.writeFileSync(file,css.replace(from,to));
console.log('Updated narrow-phone breakpoint to 380px.');
