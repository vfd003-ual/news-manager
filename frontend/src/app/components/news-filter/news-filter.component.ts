import { Component, EventEmitter, OnInit, Output, Input } from '@angular/core';
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
  @Input() sources: string[] = [];
  
  filterForm: FormGroup;
  
  constructor(private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      source: [''],
      searchTerm: ['']
    });
  }
  
  ngOnInit(): void {
  }
  
  applyFilter(): void {
    const filter: NewsFilter = {
      source: this.filterForm.value.source || undefined,
      searchTerm: this.filterForm.value.searchTerm || undefined
    };
    
    this.filterChange.emit(filter);
  }
  
  resetFilter(): void {
    this.filterForm.reset({
      source: '',
      searchTerm: ''
    });
    
    this.filterChange.emit({});
  }
}