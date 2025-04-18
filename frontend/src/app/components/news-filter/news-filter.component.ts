import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { NewsFilter } from '../../models/news.model';

@Component({
  selector: 'app-news-filter',
  standalone: true, 
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './news-filter.component.html',
  styleUrls: ['./news-filter.component.scss']
})
export class NewsFilterComponent implements OnInit {
  @Output() filterChange = new EventEmitter<NewsFilter>();
  
  filterForm: FormGroup;
  
  constructor(private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      category: [''],
      source: [''],
      dateFrom: [null],
      dateTo: [null],
      searchTerm: ['']
    });
  }
  
  ngOnInit(): void {
  }
  
  applyFilter(): void {
    const filter: NewsFilter = {
      category: this.filterForm.value.category || undefined,
      source: this.filterForm.value.source || undefined,
      dateFrom: this.filterForm.value.dateFrom || undefined,
      dateTo: this.filterForm.value.dateTo || undefined,
      searchTerm: this.filterForm.value.searchTerm || undefined
    };
    
    this.filterChange.emit(filter);
  }
  
  resetFilter(): void {
    this.filterForm.reset({
      category: '',
      source: '',
      dateFrom: null,
      dateTo: null,
      searchTerm: ''
    });
    
    this.filterChange.emit({});
  }
}