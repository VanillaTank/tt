import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { DataHandlerService } from "../../service/data-handler.service";
import { Task } from 'src/app/model/Task';
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { EditTaskDialogComponent } from "../../dialog/edit-task-dialog/edit-task-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { ConfirmDialogComponent } from "../../dialog/confirm-dialog/confirm-dialog.component";
import { Category } from "../../model/Category";

@Component({
    selector: 'app-tasks',
    templateUrl: './tasks.component.html',
    styleUrls: ['./tasks.component.css']
})
export class TasksComponent implements OnInit {


    // поля для таблицы (те, что отображают данные из задачи - должны совпадать с названиями переменных класса)
    // порядок строк в массиве определяет порядок столбцов
    displayedColumns: string[] = ['color', 'id', 'title', 'date', 'priority', 'category', 'operations', 'select'];
    dataSource: MatTableDataSource<Task>; // контейнер - источник данных для таблицы

    // ссылки на компоненты таблицы
    @ViewChild(MatPaginator, { static: false }) private paginator: MatPaginator;
    @ViewChild(MatSort, { static: false }) private sort: MatSort;


    @Output()
    deleteTask = new EventEmitter<Task>();

    @Output()
    updateTask = new EventEmitter<Task>();

    @Output()
    selectCategory = new EventEmitter<Category>();

    @Output()
    filterByTitle = new EventEmitter<string>();

    @Output()
    filterByStatus = new EventEmitter<boolean>()

    @Output()
    filterByPriority = new EventEmitter<string>()

    tasks: Task[];

    selectedStatusFilter: boolean;
    searchTaskText: string = '';

    selectedPriorityFilter: string = '';


    // текущие задачи для отображения на странице
    @Input('tasks')
    set setTasks(tasks: Task[]) { // напрямую не присваиваем значения в переменную, только через @Input
        this.tasks = tasks;
        this.fillTable();
    }


    constructor(
        private dataHandler: DataHandlerService, // доступ к данным
        private dialog: MatDialog, // работа с диалоговым окном

    ) {
    }

    ngOnInit() {

        // this.dataHandler.getAllTasks().subscribe(tasks => this.tasks = tasks);

        // датасорс обязательно нужно создавать для таблицы, в него присваивается любой источник (БД, массивы, JSON и пр.)
        this.dataSource = new MatTableDataSource();
        this.fillTable(); // заполняем таблицы данными (задачи) и всеми метаданными
    }


    toggleTaskCompleted(task: Task) {
        task.completed = !task.completed;
    }

    // в зависимости от статуса задачи - вернуть цвет названия
    getPriorityColor(task: Task): string {

        // цвет завершенной задачи
        if (task.completed) {
            return '#F8F9FA'; // TODO вынести цвета в константы (magic strings, magic numbers)
        }

        if (task.priority && task.priority.color) {
            return task.priority.color;
        }

        return '#fff'; // TODO вынести цвета в константы (magic strings, magic numbers)

    }

    // показывает задачи с применением всех текущий условий (категория, поиск, фильтры и пр.)
    fillTable(): void {

        if (!this.dataSource) {
            return;
        }

        this.dataSource.data = this.tasks; // обновить источник данных (т.к. данные массива tasks обновились)

        this.addTableObjects();


        // когда получаем новые данные..
        // чтобы можно было сортировать по столбцам "категория" и "приоритет", т.к. там не примитивные типы, а объекты
        // @ts-ignore - показывает ошибку для типа даты, но так работает, т.к. можно возвращать любой тип
        this.dataSource.sortingDataAccessor = (task, colName) => {

            // по каким полям выполнять сортировку для каждого столбца
            switch (colName) {
                case 'priority': {
                    return task.priority ? task.priority.id : null;
                }
                case 'category': {
                    return task.category ? task.category.title : null;
                }
                case 'date': {
                    return task.date ? task.date : null;
                }

                case 'title': {
                    return task.title;
                }
            }
        };


    }

    addTableObjects(): void {
        this.dataSource.sort = this.sort; // компонент для сортировки данных (если необходимо)
        this.dataSource.paginator = this.paginator; // обновить компонент постраничности (кол-во записей, страниц)
    }

    // диалоговое редактирования для добавления задачи
    openEditTaskDialog(task: Task): void {

        // открытие диалогового окна
        const dialogRef = this.dialog.open(EditTaskDialogComponent, {
            data: [task, 'Редактирование задачи'],
            autoFocus: false
        });

        dialogRef.afterClosed().subscribe(result => {
            // обработка результатов

            if (result === 'complete') {
                task.completed = true;
                this.updateTask.emit(task);
                return;
            }

            if (result === 'activate') {
                task.completed = false;
                this.updateTask.emit(task);
                return;
            }


            if (result === 'delete') {
                this.deleteTask.emit(task);
                return;
            }

            if (result as Task) { // если нажали ОК и есть результат
                this.updateTask.emit(task);
                return;
            }

        });
    }

    openDeleteDialog(task: Task) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            maxWidth: '500px',
            data: { dialogTitle: 'Подтвердите дейстие', message: `Удалить задачу ${task.title}?` },
            autoFocus: false
        });
        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.deleteTask.emit(task);
            }
        })
    }
    onToggleStatus(task: Task) {
        task.completed = !task.completed;
        this.updateTask.emit(task);
    }

    onSelectCategory(category: Category) {
        this.selectCategory.emit(category);
    }

    onFilterByStatus(value: boolean) {
        if (value !== this.selectedStatusFilter) {
            this.selectedStatusFilter = value;
           this.filterByStatus.emit(this.selectedStatusFilter) 
        }
    }

    onFilterByTitle() {
        this.filterByTitle.emit(this.searchTaskText)
    }

    onFilterByPriority(value:string) {
        if (value !== this.selectedPriorityFilter) {
            this.selectedPriorityFilter = value;
           this.filterByPriority.emit(this.selectedPriorityFilter) 
        }
    }
}
