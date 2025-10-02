import { JobRepository } from "../repositories/JobRepository";

export class JobService{
    private jobRepository:JobRepository;
    constructor(_jobRepository:JobRepository){
        this.jobRepository=_jobRepository;
    }
}