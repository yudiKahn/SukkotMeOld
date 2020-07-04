module.exports = class CRUD {
    constructor(dbModel){
        this.Model = dbModel;
    }
    #getModel = function(model){
        let models = require('./model');
        let modelsKeys = Object.keys(models);
        let modelsValues = Object.values(models);
        return modelsValues[modelsKeys.indexOf(model)];
    }
    Create(obj){
        let newDoc = new this.#getModel(this.Model)(obj);
        newDoc.save().then(doc=>{ return doc }).catch(()=>{ return false })
    }
    async ReadAll(){
        let res = null;
        let model = this.#getModel(this.Model);
        await model.find({}).then(doc=>{ res = doc }).catch(()=>{ return false })
        return res;
    }
    Read(objToFindBy){
        let model = this.#getModel(this.Model);
        model.find(objToFindBy).then(doc => { return doc }).catch(err => { return err });
    }
    UpdateById(id, newObj){
        let model = this.#getModel(this.Model);
        model.updateOne({_id:id},{newObj}).then(()=>{ return true }).catch(()=>{ return false })
    }
    Update(objToFindBy, newObj){
        let model = this.#getModel(this.Model);
        model.updateOne(objToFindBy, {newObj}).then(()=>{ return true }).catch(()=>{ return false })
    }
    DeleteById(id){
        let model = this.#getModel(this.Model);
        model.deleteOne({_id:id}).then(()=>{ return true }).catch(()=>{ return false })
    }
    Delete(objToFindBy){
        let model = this.#getModel(this.Model);
        model.deleteOne(objToFindBy).then(()=>{ return true }).catch(()=>{ return false })
    }
}