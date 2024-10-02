const fs = require('fs');
const crypto = require('crypto');
const util = require('util');

const scrypt = util.promisify(crypto.scrypt);
class UsersRepository{
    constructor(filename){
        if(!filename){
            throw new Error("creating a repository requires a filename");
        }
        this.filename = filename;
        try{
            fs.accessSync(this.filename); 
        }catch(err){
            fs.writeFileSync(this.filename,'[]');
        }   
    }
    
    async getAll(){
        //open the file called this.filename 
        // read its contents
        // parse the contents (json)
        // return the parsed data

        return JSON.parse(await fs.promises.readFile(this.filename,{
            encoding : 'utf8'
        }));
    }

    async create(attrs){
        // {object} add to the array or users and add it to the users.json file
        attrs.id = this.randomId();
        
        const salt = crypto.randomBytes(8).toString('hex');
        const buf = await scrypt(attrs.password,salt,64);

        const records = await this.getAll();
        const record = {
            ...attrs,
            password:`${buf.toString('hex')}.${salt}`
        };
        records.push(record);

        await this.writeAll(records);

        return record;
    }
    async comparePasswords(saved,supplied){
        // saved -> password saved in our database. 'hashed.salt'
        // supplied -> password given to us by a user trying sign in
        // const result = saved.split('.');
        // const hashed = result[0];
        // const salt = result[1];
        const [hashed ,salt] = saved.split('.');
        const hashedSuppliedBuf = await scrypt(supplied,salt,64);

        return hashed === hashedSuppliedBuf.toString('hex');
    }
    async writeAll(records){
    // write the updated 'records' array back to this.filename
    await fs.promises.writeFile(this.filename, JSON.stringify(records,null, 2));
    }

    randomId(){
        return crypto.randomBytes(4).toString('hex');
    }

    async getOne(id){
        const records = await this.getAll();

       return records.find(record => record.id === id);
    }
    async delete(id){
        const records = await this.getAll();
        const filterRecords = records.filter(record => record.id !== id);
        await this.writeAll(filterRecords); 
    }

    async update(id,attrs){
        const records = await this.getAll();
        const record = records.find(record => record.id === id)

        if(!record){
            throw new Error (`Record with id ${id} not found`)
        }

        // object.assgin copies the second argument onto the first argument
        // example 
        // record === {email : 'test@test.com'}
        // attrs === {password: 'mypassword'};
        Object.assign(record,attrs);
        // record === {email : 'test@test.com',password: 'mypassword'}
        await this.writeAll(records)
    }
    async getOneBy(filter){
        const records = await this.getAll();
        for(let record of records){
            let found = true;
            for(let key in filter){
                 if(record[key] !== filter[key]){
                    found = false;
                 }
            }
            if(found){
                return record;
            }
        }
    }
}

module.exports = new UsersRepository ('users.json');

// const test = async () =>{
//     const repo = new UsersRepository('users.json');

//     //    await repo.create({email:'test@test.com',password:'password'});

//     //    const users = await repo.getAll();
//     //     const user = await repo.getOne('64ed05ss'); 
//     //    console.log(user);

//     // await repo.delete('5235f40a');

//     // await repo.create({email : 'test@test.com'})

//     // await repo.update('022137de',{password: 'mypassword'})

//     const user = await repo.getOneBy({email:'test@Test.com' });
//     console.log(user);
// };

// test();  
