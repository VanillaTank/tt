import { Component, OnInit } from '@angular/core';
import { DataHandlerService } from "./service/data-handler.service";
import { Task } from './model/Task';
import { Category } from "./model/Category";
import { Priority } from './model/Priority';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styles: []
})
export class AppComponent implements OnInit {

    title = 'Todo';
    tasks: Task[];
    categories: Category[];
    priorities: Priority[];

    selectedCategory: Category = null;

    // поиск
    statusFilter: boolean;
    searchTaskText: string = '';
    searchTaskPriority: string = '';

    constructor(
        private dataHandler: DataHandlerService, // фасад для работы с данными
    ) {
    }

    ngOnInit(): void {
        // this.dataHandler.getAllTasks().subscribe(tasks => this.tasks = tasks);
        this.dataHandler.getAllPriorities().subscribe(priorities => this.priorities = priorities);
        this.dataHandler.getAllCategories().subscribe(categories => this.categories = categories);
        this.onSelectCategory(null); // показать все задачи

    }


    // изменение категории
    onSelectCategory(category: Category) {
        this.selectedCategory = category;
        this.updateTasks();
    }

    // обновление задачи
    onUpdateTask(task: Task) {

        this.dataHandler.updateTask(task).subscribe(() => {
            this.dataHandler.searchTasks(
                this.selectedCategory,
                null,
                null,
                null
            ).subscribe(tasks => {
                this.tasks = tasks;
            });
        });

    }

    // удаление задачи
    onDeleteTask(task: Task) {

        this.dataHandler.deleteTask(task.id).subscribe(() => {
            this.dataHandler.searchTasks(
                this.selectedCategory,
                null,
                null,
                null
            ).subscribe(tasks => {
                this.tasks = tasks;
            });
        });
    }

    onDeleteCategory(category: Category) {
        this.dataHandler.deleteCategory(category.id).subscribe(cat => {
            this.selectedCategory = null;
            this.onSelectCategory(this.selectedCategory);
        })
    }

    onUpdateCategory(category: Category) {
        this.dataHandler.updateCategory(category).subscribe(cat => {
            this.onSelectCategory(this.selectedCategory);
        })
    }

    onFilterTaskByStatus(status: boolean) {
        this.statusFilter = status;
        this.updateTasks();
    }
    onFilterTaskByTitle(searchString: string) {
        this.searchTaskText = searchString;
        this.updateTasks();
    }


    onFilterByPriority(searchString: string) {
        this.searchTaskPriority = searchString;
        this.updateTasks();
    }

    updateTasks() {
        this.dataHandler.searchTasks(
            this.selectedCategory,
            this.searchTaskText,
            this.statusFilter,
            this.searchTaskPriority
        ).subscribe(tasks => {
            this.tasks = tasks;
        });

    }
}
