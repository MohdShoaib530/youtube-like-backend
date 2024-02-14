class apiResponse {
    constructor(statusCode ,data, success = true, message = "Success"){
       this.statusCode = statusCode,
       this.data = data,
       this.success = success,
       this.message = message
    }
}