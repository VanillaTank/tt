import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DataHandlerService } from "../../service/data-handler.service";
import { Category } from "../../model/Category";
import { EditCategoryDialogComponent } from 'src/app/dialog/edit-category-dialog/edit-category-dialog.component';
import { MatDialog } from "@angular/material/dialog";

@Component({
    selector: 'app-categories',
    templateUrl: './categories.component.html',
    styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {

    @Input()
    categories: Category[];

    @Input()
    selectedCategory: Category;

    // выбрали категорию из списка
    @Output()
    selectCategory = new EventEmitter<Category>();

    @Output()
    deleteCategory = new EventEmitter<Category>();

    @Output()
    updateCategory = new EventEmitter<Category>();

    indexMouseMove: number;

    constructor(
        private dataHandler: DataHandlerService,  
        // работа с диалоговым окном
        private dialog: MatDialog, ) {
    }

    // метод вызывается автоматически после инициализации компонента
    ngOnInit() {
        this.dataHandler.getAllCategories().subscribe(categories => this.categories = categories);
    }


    showTasksByCategory(category: Category): void {

        // если не изменилось значение, ничего не делать (чтобы лишний раз не делать запрос данных)
        if (this.selectedCategory === category) {
            return;
        }

        this.selectedCategory = category; // сохраняем выбранную категорию

        // вызываем внешний обработчик и передаем туда выбранную категорию
        this.selectCategory.emit(this.selectedCategory);
    }

    showEditIcon(index: number) {
        this.indexMouseMove = index;
    }

    openEditDialog(category: Category): boolean {
        const dialogRef = this.dialog.open(EditCategoryDialogComponent, {
            maxWidth: '400px',
            data: [category.title, 'Редактирование категории'],
            autoFocus: false
        });
        dialogRef.afterClosed().subscribe((result) => {
            if (result === 'delete') {
                this.deleteCategory.emit(category); // вызываем внешний обработчик
                return;
            }
            if(typeof result === 'string') { // нажали сохранить
                category.title = result as string;
                this.updateCategory.emit(category); // вызываем внешний обработчик
                return;
            }
        });
        return true;
        
    }
}
