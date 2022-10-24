import { Injectable } from '@angular/core';
import { Task } from '../model/Task';
import { Observable } from "rxjs";
import { TaskDAOArray } from "../data/dao/impl/TaskDAOArray";
import { Category } from "../model/Category";
import { CategoryDAOArray } from "../data/dao/impl/CategoryDAOArray";
import { Priority } from "../model/Priority";
import { PriorityDAOArray } from "../data/dao/impl/PriorityDAOArray";


// класс реализовывает методы, которые нужны frontend'у, т.е. для удобной работы представлений
// напоминает паттер Фасад (Facade) - выдает только то, что нужно для функционала
// сервис не реализовывает напрямую интерфейсы DAO, а использует их реализации (в данном случае массивы)
// может использовать не все методы DAO, а только нужные

@Injectable({
    providedIn: 'root'
})
export class DataHandlerService {

    // релизации работы с данными с помощью массива
    // (можно подставлять любые релизации, в том числе с БД. Главное - соблюдать интерфейсы)
    private taskDaoArray = new TaskDAOArray();
    private categoryDaoArray = new CategoryDAOArray();
    private priorityDaoArray = new PriorityDAOArray();


    constructor() {
    }

    getAllTasks(): Observable<Task[]> {
        return this.taskDaoArray.getAll();
    }

    getAllCategories(): Observable<Category[]> {
        return this.categoryDaoArray.getAll();
    }

    getAllPriorities(): Observable<Priority[]> {
        return this.priorityDaoArray.getAll();
    }


    updateTask(task: Task): Observable<Task> {
        return this.taskDaoArray.update(task);
    }


    // поиск задач по параметрам
    searchTasks(category: Category, searchText: string, status: boolean, priority: Priority): Observable<Task[]> {
        return this.taskDaoArray.search(category, searchText, status, priority);
    }

    deleteTask(id: number): Observable<Task> {
        return this.taskDaoArray.delete(id);
    }

    deleteCategory(id: number): Observable<Category> {
        return this.categoryDaoArray.delete(id);
    }
    updateCategory(category: Category): Observable<Category> {
        return this.categoryDaoArray.update(category)
    }
}
