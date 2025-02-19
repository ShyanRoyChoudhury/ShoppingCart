enum Status{
    Success = "Success",
    Fail = "Fail",
}

class ResponseClass{
    private status: Status;
    private code: string;
    private data: Record<string, {}>

    constructor( data: {}, code: string, status: Status){
        this.status = status;
        this.code = code;
        this.data = data;
    }
    
    getStatus(): string {
        return this.status; // Assuming enum value is stored as a string
      }
}


export { ResponseClass, Status };