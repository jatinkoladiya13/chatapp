echo "Python version:"
python3.11 --version
echo "BUILD START"
python3.11 -m pip install -r requirements.txt
python3.11 manage.py collectstatic --noinput 
echo "BUILD END"