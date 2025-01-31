import Handlebars from 'handlebars';
const source=`

     <h1>Hello,{{name}}</h1>
     <p>please verify your email by clicking the link below</p>
     <a href={{DOMAIN}}{{route}}/{{_id}}>Verify Email</a>

`
const template = Handlebars.compile(source);

 const fileToSent= (data)=>{
    return template(data);
}
export default fileToSent;

