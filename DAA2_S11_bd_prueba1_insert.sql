create database bd_prueba1;

use bd_prueba1;

/*Insersiones tabla categoria*/
insert into categoria values(null,"Lacteos");
insert into categoria values(null,"Bebidas");
insert into categoria values(null,"Snacks");

/* Insersiones tabla producto*/
insert into producto values(true,8.4,7.9,24,1,null,'seccion2b','Queso parmesano','Queso parmesano de buena calidad');
insert into producto values(true,2.4,2,25,2,null,'seccion1a','Coca-Cola','Bebida refrescante de 500ml');
insert into producto values(true,1.5,1,30,3,null,'seccion2a','Papas BBQ','500 gr de puro sabor');

select * from categoria;
select*from producto;


