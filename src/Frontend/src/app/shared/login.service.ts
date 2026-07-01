import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root',
})
export class LoginService {
  // private apiUrl = "http://localhost:5062/login";
  private apiUrl = "/api/login";
  constructor(private http: HttpClient) { }

  login(login: any) {
    return this.http.post<any>(this.apiUrl, login,
      {
        observe: 'response'
      });
  }
}
