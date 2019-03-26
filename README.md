# Single page application for the simulation of house energetic consumption based on morphology, materials and bioclimatic variables. 

This project consist in the development of a prototype that supports the bioclimatic design of houses. The goals of this project is to improve what already exist in this field and to make a tool that can be used by non-expert users. This is an University internal project supported by the Faculty of Engineering, with the joint work of Informatic Engineering and Computer Science Department and Civil Engineering Department of the University of Concepcion.


## Getting Started

To get the page up and running in your machine, follow these steps.

### Commands to mount laravel
 - `composer install`
 - `cp .env.example .env`
 -  Modify .env to establish connection with localhost:
	

>     DB_CONNECTION=mysql
>     DB_HOST=127.0.0.1
>     DB_PORT=3306
>     DB_DATABASE=bioclimapp
>     DB_USERNAME=root
>     DB_PASSWORD=

 - `php artisan key:generate`

### Commands to make laravel work with REACT:
  - `sudo npm run watch` : to auto compile and execute react when a file is modified
  - `php artisan serve` : to run laravel

### Commands to activate localhost:
 -  `sudo service apache2 stop` (when is running)
 -  `sudo service mysql stop` (when is running)
 -  `sudo /opt/lampp/xampp start`

In case of an error, to prep react:
  - `php artisan preset react`
  - `sudo npm install`   (if you encounter write permission error 
   `sudo npm install --unsafe-perm=true --allow-root`)
   
### External server

Copy the server configuration bioclimapp.conf to /etc/nginx/sites-available/ and create a symbolic link in /etc/nginx/sites-enabled/

### Prerequisites

Install these packages with npm

<ul>
	<li>Three.js</li>
	<li>Reactstrap</li>
	<li>Chart.js</li>
	<li>react-chartjs-2</li>
	<li>axios</li>
	<li>react</li>
	<li>react-redux</li>
	<li>redux</li>
	<li>suncalc<li>
</ul>

## Authors

* **Matías Medina** - *Morphology and Materiales* - [matisin](https://github.com/matisin)
* **Diego Rodriguez** - *bioclimatic variables* - [dirodriguezm](https://github.com/dirodriguezm)

## License

This project is licensed under the GNU General Public License v3.0 License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* Professor Luis Merino of the University of Concepcion for the project leadership.
* For more details, check the [dissertation](memoria de titulo.pdf)
	
