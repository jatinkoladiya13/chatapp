echo "Python version:"
python3.12 --version

pip install setuptools
pip install -r requirements.txt

echo "BUILD START"
python manage.py makemigrations
python manage.py migrate
python manage.py tailwind install  
python3.12 manage.py collectstatic --noinput 
python manage.py tailwind start 
echo "BUILD END"